
class EventModel {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string; // Add time field
  description: string;
  location: string;
  locationLink: string;
  coverImageId: string;
  coverImageUrl: string;
  createdAt: string;
  hasGallery: boolean;

  constructor(
    id: string,
    title: string,
    type: string,
    date: string,
    time: string, // Add time parameter
    description: string,
    location: string,
    locationLink: string,
    coverImageId: string,
    coverImageUrl: string,
    createdAt: string,
    hasGallery: boolean = false
  ) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.date = date;
    this.time = time; // Set time property
    this.description = description;
    this.location = location;
    this.locationLink = locationLink;
    this.coverImageId = coverImageId;
    this.coverImageUrl = coverImageUrl;
    this.createdAt = createdAt;
    this.hasGallery = hasGallery;
  }
}

export default EventModel;
