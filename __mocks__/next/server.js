export class NextResponse extends Response {
  static json(body, init) {
    const response = new Response(JSON.stringify(body), {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
    });
    response.bodyData = body;
    return response;
  }
}

export class NextRequest extends Request {
  constructor(input, init) {
    super(input, init);
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }
}
