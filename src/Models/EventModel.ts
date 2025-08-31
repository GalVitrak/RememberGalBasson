import EventTypeModel from "./EventTypeModel";

class EventModel {
  id: string;
  title: string;
  type: EventTypeModel;
  date: string;
  description: string;
  location: string;
  locationLink: string;
  coverImageId: string;
  coverImageUrl: string;
  createdAt: string;

  constructor(
    id: string,
    title: string,
    type: EventTypeModel,
    date: string,
    description: string,
    location: string,
    locationLink: string,
    coverImageId: string,
    coverImageUrl: string,
    createdAt: string
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.date = date;
    this.description = description;
    this.location = location;
    this.locationLink = locationLink;
    this.coverImageId = coverImageId;
    this.coverImageUrl = coverImageUrl;
    this.createdAt = createdAt;
  }
}

export default EventModel;
