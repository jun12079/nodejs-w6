const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: "CreditPackage",
  tableName: "CREDIT_PACKAGE",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    name: {
      type: "varchar",
      length: '50',
      nullable: false,
      unique: true
    },
    credit_amount: {
      type: "integer",
      nullable: false,
    },
    price: {
      type: "numeric",
      precision: 10,
      scale: 2,
      nullable: false,
    },
    created_at: {
      type: "timestamp",
      nullable: false,
      createDate: true,
    },
  },
})
