const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("learn_nodejs", "root", null, {
	host: "localhost",
	dialect: "mysql",
  logging: false
});

const connectDb = async () => {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};
connectDb();
// module.exports = sequelize;
