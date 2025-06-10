const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

// --- Inicialización de Firebase Admin (Solo para el Servidor) ---
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}
const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Funciones de Ayuda ---
function chunkText(text, chunkSize = 700, overlap = 100) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

// --- Controlador Principal de la API ---
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, payload } = req.body;
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // --- Acción: Procesar un nuevo documento ---
    if (action === 'processDocument') {
      const { fileContent, fileName, userEmail } = payload;
      const textChunks = chunkText(fileContent);
      
      const embeddings = await Promise.all(
        textChunks.map(chunk => 
          embeddingModel.embedContent(chunk).then(result => ({
            chunkText: chunk,
            embedding: result.embedding.values,
            originalFile: fileName,
            addedBy: userEmail,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          }))
        )
      );

      const writeBatch = db.batch();
      embeddings.forEach(data => {
        const docRef = db.collection("knowledge_vectors").doc();
        writeBatch.set(docRef, data);
      });
      await writeBatch.commit();
      
      return res.status(200).json({ status: "success", chunkCount: embeddings.length });

    // --- Acción: Encontrar conocimiento y generar una respuesta ---
    } else if (action === 'queryRAG') {
      const { query } = payload;
      
      // 1. Vectorizar la pregunta del usuario
      const queryEmbeddingResult = await embeddingModel.embedContent(query);
      const queryVector = queryEmbeddingResult.embedding.values;

      // 2. Buscar en la base de datos vectorial
      const vectorsSnapshot = await db.collection("knowledge_vectors").get();
      if (vectorsSnapshot.empty) {
        return res.status(200).json({ answer: "Lo siento, la base de conocimiento está vacía. Por favor, sube algunos documentos." });
      }

      const documents = [];
      vectorsSnapshot.forEach(doc => {
        const data = doc.data();
        documents.push({ ...data, similarity: dotProduct(queryVector, data.embedding) });
      });

      documents.sort((a, b) => b.similarity - a.similarity);
      const topN = 5;
      const relevantChunks = documents.slice(0, topN);

      // 3. Construir el prompt aumentado
      let finalPrompt;
      if (relevantChunks.length > 0) {
        const context = relevantChunks.map(chunk => chunk.chunkText).join("\n---\n");
        finalPrompt = `Eres Clara, una experta en seguros. Responde la pregunta del usuario basándote únicamente en el siguiente contexto extraído de los documentos. Si la respuesta no está en el contexto, indícalo claramente.\n\n[CONTEXTO]\n${context}\n\n[PREGUNTA DEL USUARIO]\n${query}`;
      } else {
        finalPrompt = `Eres Clara, una experta en seguros. Responde la pregunta del usuario con tu conocimiento general, pero indica que no encontraste información específica en los documentos.\n\n[PREGUNTA DEL USUARIO]\n${query}`;
      }
      
      // 4. Generar la respuesta final
      const generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await generativeModel.generateContent(finalPrompt);
      const response = await result.response;

      return res.status(200).json({ answer: response.text() });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error(`Error in /api/process: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
