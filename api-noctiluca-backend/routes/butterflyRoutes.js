import express from "express";
import {getAllButterflies, getOneButterfly, createButterfly,deleteButterfly, updateButterfly} from "../controllers/ButterflyController.js";
import {butterflyBodyRules, idParamRules, validateResult} from "../validators/butterfliesValidator.js";

const router = express.Router();

// GET - listado de todas las mariposas
router.get("/", getAllButterflies);

// GETONE - obtener una mariposa por ID
router.get("/:id", idParamRules, validateResult, getOneButterfly);

// POST - crear mariposa (con validaciones)
router.post("/", butterflyBodyRules, validateResult, createButterfly);

// DELETE - borrar mariposa (validar id)
router.delete("/:id", idParamRules, validateResult, deleteButterfly);

// PUT - actualizar una mariposa
router.put("/:id", idParamRules, validateResult, updateButterfly);

export default router;

