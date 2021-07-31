import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it('should be able to show a user profile', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Test',
      email: 'user@test.com',
      password: '1234'
    })

    const user_id = user.id;

    const userProfile = await showUserProfileUseCase.execute(user_id)

    expect(userProfile).toHaveProperty('id')
  })

  it('should not be able to show a non-existing user profile', async () => {
    expect(async () => {
      const user_id = 'falseid123'

      await showUserProfileUseCase.execute(user_id)
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})