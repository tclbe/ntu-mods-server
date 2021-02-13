const { Sequelize } = require("sequelize")

const sequelize = new Sequelize(
  "postgres://adminuserntu:J9H1Emowi7HofqWfBMWw@c-t.cdhgfzwjhcsk.ap-southeast-1.rds.amazonaws.com:5432/ntu"
)

async function connectPostgres() {
  try {
    await sequelize.authenticate()
    console.log("Connection has been established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
}
