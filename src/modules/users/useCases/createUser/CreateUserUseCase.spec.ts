import { CreateUserUseCase } from "./CreateUserUseCase"
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('should be able to create a new user', async () => {
    const user = {
      name: 'User Test',
      email: 'user@test.com',
      password: '1234'
    }

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    })

    const userCreated = await inMemoryUsersRepository.findByEmail(user.email)

    expect(userCreated).toHaveProperty('id');
  })

  it('should not be able to create a already existing user', async () => {
    expect(async () => {
      const user = {
        name: 'User Test',
        email: 'user@test.com',
        password: '1234'
      }
  
      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      })

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })
})