import request from "supertest";
import { app, server } from "../app.js"
import db_connection from "../database/db_connection.js"
import ButterflyModel from "../models/ButterflyModel.js";

describe("test butterflies crud", () => {
    beforeAll(async () => { // antes de todo se conecta
        await db_connection.authenticate() //con eso se conecta
    })

    //Método GET all butterflies
    describe("GET /butterflies", () => {
        let response
        beforeEach(async () => {
            response = await request(app).get("/api/butterflies").send()
        })

        test('should return a response with status 200 and type json', async () => {
            expect(response.status).toBe(200)
            expect(response.headers['content-type']).toContain('json')
        })

        test('should return array of butterflies', async () => {
            expect(response.body).toBeInstanceOf(Array)
        })
    })

    //Método GET one butterfly/:id
    describe("GET /butterflies/:id", () => {
        let response
        let createdButterfly = {}
        beforeEach(async () => {
            createdButterfly = await ButterflyModel.create({
                name: "test",
                other_names: "test",
                family: "test",
                location: "test",
                habitat: "test",
                morphology: "test",
                life: "test",
                feeding: "test",
                conservation: "test",
                about_conservation: "LC",
                image: "test"
            })
            response = await request(app).get(`/api/butterflies/${createdButterfly.id}`).send()
        })

        test('should return status 200 and JSON', async () => {
            expect(response.status).toBe(200)
            expect(response.headers['content-type']).toContain('json')
        })

        test('should return the correct butterfly', async () => {
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body.id).toBe(createdButterfly.id)
            expect(response.body.name).toBe(createdButterfly.name)
            //Se puede añadir todos los campos si se quiere
        })
    })

    //Método POST one butterfly/:id
    describe("POST /Butterflies", () => {
        let response
        let newButterflyData = {
            name: "Test Butterfly",
            other_names: "Testus papilio",
            family: "Testidae",
            location: "Testland",
            habitat: "Test habitat",
            morphology: "Test morphology",
            life: "Test life cycle",
            feeding: "Test food",
            conservation: "Test conservation",
            about_conservation: "LC", // siempre tiene que ser un valor válido del ENUM
            image: "test.jpg"
        }

        beforeEach(async () => {
            response = await request(app).post("/api/butterflies").send(newButterflyData)
        })

        test('should return status 201 and JSON', async () => {
            expect(response.status).toBe(201) //201-> creado
            expect(response.headers['content-type']).toContain('json')
        })

        test('should return the created butterfly', async () => {
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body.name).toBe(newButterflyData.name)
            expect(response.body.family).toBe(newButterflyData.family)
            //Se puede añadir más campos si se quiere
        })

        test('should return 400 if required field is missing', async () => {
            const invalidButterfly = {
                //falta nombre
                family: "Testidae",
                location: "Testland",
                habitat: "Test habitat",
                morphology: "test morphology",
                life: "Test life cycle",
                feeding: "test food", 
                conservation: "Test conservation",
                about_conservation: "LC",
                image: "test.jpg"
            }

            const response = await request(app).post("/api/butterflies").send(invalidButterfly)

            expect(response.status).toBe(400) // Depende de cómo manejes errores en tu controlador
            expect(response.body).toHaveProperty("errors") //si devuelves un campo error en el JSON
        })

        test('should actually exist in the database', async () => {
            const foundButterfly = await ButterflyModel.findOne({where: {id: response.body.id}})
            expect(foundButterfly).not.toBeNull()
            expect(foundButterfly.name).toBe(newButterflyData.name)
        })
    })

    //Método PUT one butterfly/:id
    describe("PUT /butterflies/:id", () => {
        let response 
        let createdButterfly = {}
        let updatedData

        beforeEach(async () => {
            createdButterfly = await ButterflyModel.create({
                name: "Test original Butterfly",
                other_names: "Testus original papilio",
                family: "Family test",
                location: "Testland origin",
                habitat: "Test habitat",
                morphology: "Test origin morphology",
                life: "Test origin life cycle",
                feeding: "Test o food",
                conservation: "Test or conservation",
                about_conservation: "LC", 
                image: "testorigin.jpg"
            })

            updatedData = { 
                name: "Update Name",
                location: "Update Location",
                image: "updated.jpg"
            }
    
            response = await request(app).put(`/api/butterflies/${createdButterfly.id}`).send(updatedData)
        })

        test("should return status 200 and JSON", () => {
            expect(response.status).toBe(200)
            expect(response.headers["content-type"]).toContain("json")
        })

        test("should return the updated butterfly", () => {
            expect(response.body).toBeInstanceOf(Object)
            expect(response.body.id).toBe(createdButterfly.id)
            expect(response.body.name).toBe(updatedData.name)
            expect(response.body.location).toBe(updatedData.location)
            expect(response.body.image).toBe(updatedData.image)
        })

        test("should update the butterfly in the database", async () => {
            const butterflyInDB = await ButterflyModel.findByPk(createdButterfly.id) //findByPk: para buscar un registro por su PrimaryKey
            expect(butterflyInDB.name).toBe(updatedData.name)
            expect(butterflyInDB.location).toBe(updatedData.location)
            expect(butterflyInDB.image).toBe(updatedData.image)
        })
    })

    //Método DELETE one butterfly/:id
    describe("DELETE /butterflies", () => {
        let response
        let createdButterfly = {}

        beforeEach(async () => {//antes de cada test, crea una mariposa y hace la petición
            createdButterfly = await ButterflyModel.create({
                name: "test",
                other_names: "test",
                family: "test",
                location: "test",
                habitat: "test",
                morphology: "test",
                life: "test",
                feeding: "test",
                conservation: "test",
                about_conservation: "LC",
                image: "test"
            })
            response = await request(app).delete(`/api/butterflies/${createdButterfly.id}`).send()
        })

        test('should return a response with status 200 and type json', async () => {
            expect(response.status).toBe(200)
            expect(response.headers['content-type']).toContain('json')
        })

        test('should return a message butterfly deleted successfully', async () => {
            expect(response.body.message).toContain("Butterfly deleted successfully")
            const foundButterfly = await ButterflyModel.findOne({ where: { id: createdButterfly.id } })
            expect(foundButterfly).toBeNull();
        })
    })

    afterAll(async () => { // funciona como el beforeAll, después de cada testeo lo apagamos/cerramos
        try {
            await db_connection.truncate({ cascade: true }) //Borra todos los datos de todas las tablas
            server.close() // para que Jest no se quede colgado
            await db_connection.close()
        } catch (error) {
            console.error("Error limpiando/cerrando la BD de test:", err)
        }
    })
})