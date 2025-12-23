import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import llmRoute from "../routes/llm.route.js"
import invoiceExtractRoute from "../routes/llm.route.js"


const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(express.text({ type: 'application/xml' })); 
app.use(cors({
  origin: "*",
  credentials: true
}))

const PORT = process.env.PORT


app.post('/tally', async (req, res) => {
  try {
    const tallyResponse = await fetch('http://localhost:9000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: req.body,
    });

    const data = await tallyResponse.text();

    res
      .header('Access-Control-Allow-Origin', 'http://localhost:5173')
      .header('Access-Control-Allow-Credentials', 'true')
      .header('Content-Type', 'application/xml')
      .status(tallyResponse.status)
      .send(data);

  } catch (error) {
    console.error('Error connecting to Tally:', error);
    res.status(500).send(
      `<ENVELOPE><HEADER><STATUS>0</STATUS></HEADER><BODY><DATA></DATA></BODY><ERROR>${error.message}</ERROR></ENVELOPE>`
    );
  }
});


app.use('/api/llm-call', llmRoute)


// export default (req, res) => app(req, res);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});



