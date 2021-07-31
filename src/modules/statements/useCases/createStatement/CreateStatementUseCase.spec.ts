import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository)
  })

  it('should be able to make a deposit', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: '1234'
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: 'deposit' as OperationType,
      amount: 10,
      description: 'Deposit test description'
    })

    expect(statement).toHaveProperty('id')
    expect(statement.type).toBe('deposit')
  })

  it('should not be able to make a deposit to a non-existing user', async () => {
    expect(async () => {
      const user_id = 'falseid123'

      const statement = await createStatementUseCase.execute({
        user_id,
        type: 'deposit' as OperationType,
        amount: 10,
        description: 'Deposit test description'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should be able to make a withdraw', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: '1234'
    })

    const deposit = await createStatementUseCase.execute({
      user_id: user.id,
      type: 'deposit' as OperationType,
      amount: 20,
      description: 'Deposit test description'
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id,
      type: 'withdraw' as OperationType,
      amount: 10,
      description: 'Withdraw test description'
    })

    expect(statement).toHaveProperty('id')
    expect(statement.type).toBe('withdraw')
  })

  it('should not be able to make a withdraw to a non-existing user', async () => {
    expect(async () => {
      const user_id = 'falseid123'

      const statement = await createStatementUseCase.execute({
        user_id,
        type: 'withdraw' as OperationType,
        amount: 10,
        description: 'Withdraw test description'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should not be able to make a withdraw with insufficient funds', async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'User Test',
        email: 'user@test.com',
        password: '1234'
      })
  
      const deposit = await createStatementUseCase.execute({
        user_id: user.id,
        type: 'deposit' as OperationType,
        amount: 5,
        description: 'Deposit test description'
      })
  
      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        type: 'withdraw' as OperationType,
        amount: 10,
        description: 'Withdraw test description'
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})