const NextResponse = {
  json: jest.fn((data, init) => ({
    json: () => Promise.resolve(data),
    status: init?.status || 200,
    ok: (init?.status || 200) < 400,
    _data: data,
  })),
  redirect: jest.fn((url) => ({ url, status: 302 })),
  next: jest.fn(() => ({ type: 'next' })),
};

class NextRequest {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this._body = init.body || null;
  }
  async json() { return JSON.parse(this._body); }
}

module.exports = { NextResponse, NextRequest };
