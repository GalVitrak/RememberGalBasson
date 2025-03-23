class CredentialsModel {
  username: string;
  password: string;

  constructor(id: string, password: string) {
    this.username = id;
    this.password = password;
  }
}

export default CredentialsModel;
