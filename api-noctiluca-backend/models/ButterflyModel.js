import { DataTypes } from "sequelize";
import db_connection from "../database/db_connection.js";

const ButterflyModel = db_connection.define('butterflies', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    other_names: {
        type: DataTypes.STRING,
    },
    family: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    habitat: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    morphology: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    life: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    feeding: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    conservation: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    about_conservation: {
        type: DataTypes.ENUM('LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX', 'DD', 'NE'),
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    underscored: true
});

export default ButterflyModel;