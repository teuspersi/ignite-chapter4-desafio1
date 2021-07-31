import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

import { BalanceMap } from '../../mappers/BalanceMap';
import { GetBalanceError } from "./GetBalanceError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository:  InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;


describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  })

  it('should be able to get user balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: '1234'
    })

    const user_id = user.id;
    
    const balance = await  getBalanceUseCase.execute({user_id})

    const balanceDTO = BalanceMap.toDTO(balance);

    expect(balanceDTO).toHaveProperty('balance')
    expect(balanceDTO).toHaveProperty('statement')
  })

  it('should not be able to get a non-existing user balance', async () => {
    expect(async () => {
      const user_id = 'falseid123'
    
      const balance = await getBalanceUseCase.execute({user_id})

      const balanceDTO = BalanceMap.toDTO(balance);
    }).rejects.toBeInstanceOf(GetBalanceError)
  })
})