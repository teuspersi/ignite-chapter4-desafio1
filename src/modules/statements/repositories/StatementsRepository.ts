import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";
export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    receiver_id,
    amount,
    description,
    type,
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      receiver_id,
      amount,
      description,
      type,
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({
    statement_id,
    user_id,
  }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id },
    });
  }

  async getUserBalance({
    user_id,
    with_statement = false,
  }: IGetBalanceDTO): Promise<
    { balance: number } | { balance: number; statement: Statement[] }
  > {
    const statement = await this.repository
      .createQueryBuilder("statement")
      .select([
        "statement.id",
        "statement.user_id",
        "statement.receiver_id",
        "statement.amount",
        "statement.description",
        "statement.type",
        "statement.created_at",
        "statement.updated_at",
      ])
      .where(
        "statement.user_id = :user_id OR statement.receiver_id = :user_id",
        {
          user_id: user_id,
        }
      )
      .getMany();

    const balance = statement.reduce((acc, operation) => {
      const userIsReceiver = operation.receiver_id === user_id;

      if (
        operation.type === "deposit" ||
        (operation.type === "transfer" && userIsReceiver)
      ) {
        return acc + Number(operation.amount);
      } else {
        return acc - Number(operation.amount);
      }
    }, 0);

    console.log(statement);

    if (statement) {
      if (with_statement) {
        return {
          statement,
          balance,
        };
      }
    }

    return { balance };
  }
}
