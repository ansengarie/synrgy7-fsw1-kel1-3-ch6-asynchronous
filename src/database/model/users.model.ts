import { Model, ModelObject } from "objection";
import { InvoiceModel } from "./invoice.model";

export class UsersModel extends Model {
  id!: string;
  username!: string;
  password!: string;
  role!: string;

  static get tableName() {
    return "users";
  }

  static get relationMappings() {
    return {
      invoice: {
        relation: Model.HasManyRelation,
        modelClass: InvoiceModel,
        join: {
          from: "users.id",
          to: "invoice.user_id",
        },
      },
    };
  }
}

export type Users = ModelObject<UsersModel>;
