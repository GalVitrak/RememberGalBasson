class EventTypeModel {
  id: string;
  name: string;
  description: string;
  defaultImageId: string;
  defaultImageUrl: string;

  constructor(
    id: string,
    name: string,
    description: string,
    defaultImageId: string = "",
    defaultImageUrl: string = ""
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.defaultImageId = defaultImageId;
    this.defaultImageUrl = defaultImageUrl;
  }
}

export default EventTypeModel;
