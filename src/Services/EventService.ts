import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";

class EventService {
  public async addEvent(
    eventData: any
  ): Promise<void> {
    try {
      const addEvent = httpsCallable(
        functions,
        "addEvent"
      );

      await addEvent({
        event: eventData,
      });
    } catch (error) {
      throw error;
    }
  }

  public async addEventType(eventTypeData: {
    name: string;
    description: string;
    imageData: {
      fileName: string;
      mimeType: string;
      base64Data: string;
    };
  }): Promise<{
    success: boolean;
    message: string;
    id: string;
  }> {
    try {
      const addEventType = httpsCallable(
        functions,
        "addEventType"
      );

      const response = await addEventType(
        eventTypeData
      );

      return response.data as {
        success: boolean;
        message: string;
        id: string;
      };
    } catch (error) {
      throw error;
    }
  }

  public async uploadGalleryPhotos(
    eventId: string,
    photos: {
      fileName: string;
      mimeType: string;
      base64Data: string;
    }[]
  ): Promise<{
    success: boolean;
    message: string;
    uploadedCount: number;
    totalSubmitted: number;
  }> {
    try {
      const uploadGalleryPhotos = httpsCallable(
        functions,
        "uploadGalleryPhotos"
      );

      const response = await uploadGalleryPhotos({
        eventId,
        photos,
      });

      return response.data as {
        success: boolean;
        message: string;
        uploadedCount: number;
        totalSubmitted: number;
      };
    } catch (error) {
      throw error;
    }
  }

  public async updateEventType(updateData: {
    id: string;
    name: string;
    description: string;
    imageData?: {
      fileName: string;
      mimeType: string;
      base64Data: string;
    };
    oldImageId?: string;
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const updateEventType = httpsCallable(
        functions,
        "updateEventType"
      );

      const response = await updateEventType(
        updateData
      );

      return response.data as {
        success: boolean;
        message: string;
      };
    } catch (error) {
      throw error;
    }
  }

  public async deleteGalleryPhoto(
    eventId: string,
    photoId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const deleteGalleryPhoto = httpsCallable(
        functions,
        "deleteGalleryPhoto"
      );

      const response = await deleteGalleryPhoto({
        eventId,
        photoId,
      });

      return response.data as {
        success: boolean;
        message: string;
      };
    } catch (error) {
      throw error;
    }
  }

  public async updateEvent(updateData: {
    id: string;
    title: string;
    type: string;
    date: string;
    time: string; // Add time field
    description: string;
    location: string;
    locationLink: string;
    imageData?: {
      fileName: string;
      mimeType: string;
      base64Data: string;
    };
    oldImageId?: string;
    deleteCurrentImage?: boolean;
    defaultImageData?: {
      fileName: string;
      mimeType: string;
      useDefaultImage: boolean;
      defaultImageId: string;
      defaultImageUrl: string;
    };
  }): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const updateEvent = httpsCallable(
        functions,
        "updateEvent"
      );

      const response = await updateEvent(
        updateData
      );

      return response.data as {
        success: boolean;
        message: string;
      };
    } catch (error) {
      throw error;
    }
  }

  public async deleteEvent(
    eventId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const deleteEvent = httpsCallable(
        functions,
        "deleteEvent"
      );

      const response = await deleteEvent({
        eventId,
      });

      return response.data as {
        success: boolean;
        message: string;
      };
    } catch (error) {
      throw error;
    }
  }
}

const eventService = new EventService();
export { eventService };
export default eventService;
