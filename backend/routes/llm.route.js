import { Router } from "express";
import { callLLM, extractInvoice } from "../controllers/llm.controller.js";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.route("/").post(upload.single("file"), callLLM);
router.route("/extract-invoice").post(upload.single("file"), extractInvoice); 

export default router;