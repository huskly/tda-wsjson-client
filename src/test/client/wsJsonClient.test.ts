import WsJsonClient from "../../client/wsJsonClient";

describe("wsJsonClientTest", () => {
  it("should connect and log in successfully", async () => {
    const accessToken =
      "pVAA3TroIRSYwDcqWCG+0Sl4PYa9BJmbcgWtnZsSVkyuulKZd/OgoGMYAJB39vOnXcLu9s31QtOzFJfuBcUMLVKwwWkmIJwfaot0BkZzNbKTy7dGrfxXW0TStwBYTbMoOonTA9DM5O2b6Wsl9BB9GyH+zLUEJXQ7ZNZzhiTb3ePyPLbmZ3sDjUrzopHf9ljNUv90A6Ui+ZIFeKzG1zViyb1xE0/1grgWMYrZsOPH3ffB1+HG9Dk3lIQEknyIvux5dhqlR6wtNoaqS39cRgNnCjvVT6n8d0c1yWw1Zbpowh1sKvphZEEqYOqaKkXyvRJvh96Nls/Y2lbKs/IkjNjiHmSx4+CfrRNgXc2sHhvOfhC45yPf/Bn5XUASkC7x8zkvplYMMW5NVLYdDZHvoJWxSTziW54Sb28cqkuplfuRePDvaDfwXe0ZTrxA9EWVkKfVDH4JFss11Ootx+cq8q96IKbI9G+1OBMaeGZPxZYN2p3z0hqY8fEA/GhUVLEd0WTAdi0veCDQesMgmcjRD7yfFdDNvHl3A0PrBAwGjBJ1mF78Zlpy9UyBS5xwmujfk+HJ6W+3BzO5IyYl/ANswA/vwq6mSFnlVzB6PbeAZ100MQuG4LYrgoVi/JHHvlRBxqgdYBZFhsYUUfH0sPZekZqghasciJSWAjIHuIhgFjttb2stJiJAJdVJZvABfwLT9jVN2v3yDOIRWHsCo8T5/067aPdM6xiPKey8IRprJk75KonT11j45qET69KJAITgQoHJ9xoKYTyque+urlCu67iN1oAzZwFsrghb1aNIDqhC9o+gG8IJYVIM1MLln7H8cIqTZXESaTKn8926vFA20x0+AioV++4661n4sJa3KJzp5VsAcvhIHRbFuzTqLmASPJSnAVumx19Aw2b7cNOmGbO+JAXIEP4YTiACMMJyKBIqDQJBdH8ZF2qAar3ko3b75Xri9D09Kxqw/K+5f/3EPON+O7CgIMZRRVRGMvBjC1BNy1MnZAMo4c66kP5AZPFqVIhtzhSk8tiYVgm6qNNHg7JaWBFzhTR/sGgnvvvgKUpsGh+NiqkVbEWx7CxVxVsfNR4qyBOdAW2erdxIripYOM8WUzsmzfG/pk+uoDr6YOmvx4OBjgOTni4JQn4LDd18TgyPnzrr2E6KNQ7aZhUewR4CxzoDdyLdt4aAh0kg+rY2uzKbw+w7o/KuphoB6IZhe/wlfLry4z52m8gwyCx6HiScb55qjM+75GCW212FD3x19z9sWBHDJACbC00B75E";
    const client = new WsJsonClient(accessToken);
    const loginResponse = await client.connect();
    expect(loginResponse.authenticationStatus).toEqual("OK");
    expect(loginResponse.authenticated).toBeTruthy();
    expect(loginResponse.userId).toBeTruthy();
    expect(loginResponse.userCdi).toBeTruthy();
    expect(loginResponse.forceLogout).toBeFalsy();
    expect(loginResponse.userDomain).toEqual("TDA");
    expect(loginResponse.userSegment).toEqual("ADVNCED");
    expect(loginResponse.token).toBeTruthy();
    client.disconnect();
  });
});
