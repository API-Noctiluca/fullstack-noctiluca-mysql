import { Sequelize } from "sequelize";
import { DB_NAME, USER_DB, PASSWORD_DB, HOST, DB_DIALECT } from "../config/config.js";

const db_connection = new Sequelize(DB_NAME, USER_DB, PASSWORD_DB, {
    host: HOST,
    dialect: DB_DIALECT,
    define: {
        timestamps: true,
        underscored: true
    }
});

export default db_connection;