import { getApiErrorMessage } from './apiErrorMessage';

describe('getApiErrorMessage', () => {
  it("returns the backend's message", () => {
    const error = Object.assign(
      new Error('Request failed with status code 400'),
      {
        response: {
          data: {
            message: 'Um ou mais alunos não têm acesso aos e-books anexados',
          },
        },
      }
    );

    expect(getApiErrorMessage(error)).toBe(
      'Um ou mais alunos não têm acesso aos e-books anexados'
    );
  });

  it("never returns the HTTP client's own message", () => {
    expect(
      getApiErrorMessage(new Error('Request failed with status code 400'))
    ).toBeUndefined();
    expect(getApiErrorMessage({ response: { data: {} } })).toBeUndefined();
    expect(
      getApiErrorMessage({ response: { data: { message: '  ' } } })
    ).toBeUndefined();
    expect(
      getApiErrorMessage({ response: { data: { message: 42 } } })
    ).toBeUndefined();
    expect(getApiErrorMessage(null)).toBeUndefined();
  });
});
