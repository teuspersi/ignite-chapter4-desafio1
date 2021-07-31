import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository:  InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it('should be able to get a statement operation info', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: '1234'
    })

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id,
      type: 'deposit' as OperationType,
      amount: 5,
      description: 'Deposit test description'
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id!
    });
    
    expect(statementOperation).toHaveProperty('type')
    expect(statementOperation).toHaveProperty('id')
    expect(statementOperation.id).toBe(statement.id)
    expect(statementOperation.user_id).toBe(user.id)
  })

  it('should not be able to get a statement operation info to a non-existing user', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'User Test',
        email: 'user@test.com',
        password: '1234'
      })
  
      const statement = await inMemoryStatementsRepository.create({
        user_id: user.id,
        type: 'deposit' as OperationType,
        amount: 5,
        description: 'Deposit test description'
      })
  
      const statementOperation = await getStatementOperationUseCase.execute({
        user_id: 'falseid123',
        statement_id: statement.id!
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('should not be able to get a statement operation info to a non-existing statement', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'User Test',
        email: 'user@test.com',
        password: '1234'
      })
  
      const statementOperation = await getStatementOperationUseCase.execute({
        user_id: user.id,
        statement_id: 'falsestatementid123'
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})