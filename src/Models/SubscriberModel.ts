class SubscriberModel {
  id: string;
  email: string;
  name: string;
  unsubscribed: boolean;
  lastUpdated: string;

  constructor(
    id: string,
    email: string,
    name: string,
    unsubscribed: boolean = false,
    lastUpdated: string
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.unsubscribed = unsubscribed || false;
    this.lastUpdated =
      lastUpdated || new Date().toISOString();
  }
}

export default SubscriberModel;
