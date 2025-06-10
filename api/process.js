const { GoogleGenerativeAI } = require("@google/generative-ai");
const admin = require("firebase-admin");

// --- Inicialización de Firebase Admin (Solo para el Servidor) ---
// Comprueba si ya está inicializado para evitar errores en Vercel
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

    if (action === 'processDocument') {
      const { fileContent, fileName, userEmail } = payload;
      const textChunks = chunkText(fileContent);
      const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
      
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

    } else if (action === 'findKnowledge') {
      const { query } = payload;
      const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const queryEmbeddingResult = await embeddingModel.embedContent(query);
      const queryVector = queryEmbeddingResult.embedding.values;

      const vectorsSnapshot = await db.collection("knowledge_vectors").get();
      if (vectorsSnapshot.empty) {
        return res.status(200).json({ relevantChunks: [] });
      }

      const documents = [];
      vectorsSnapshot.forEach(doc => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          ...data,
          similarity: dotProduct(queryVector, data.embedding),
        });
      });

      documents.sort((a, b) => b.similarity - a.similarity);
      const topN = 5;
      const relevantChunks = documents.slice(0, topN).map(doc => ({
        text: doc.chunkText,
        source: doc.originalFile,
      }));
      
      return res.status(200).json({ relevantChunks });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error(`Error in /api/process: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
