import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import llmRoute from "../routes/llm.route.js"


const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(express.text({ type: 'application/xml' })); 
app.use(cors({
  origin: "*",
  credentials: true
}))

const PORT = process.env.PORT



app.use('/api/llm-call', llmRoute)


// export default (req, res) => app(req, res);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});



