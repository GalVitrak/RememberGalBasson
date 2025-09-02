import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";

class ContentService {
  public async addForbiddenWords(
    words: string[]
  ): Promise<{
    message: string;
    addedWords: number;
    words: string[];
  }> {
    try {
      const addForbiddenWords = httpsCallable(
        functions,
        "addForbiddenWords"
      );

      const response = await addForbiddenWords({
        words,
      });

      return response.data as {
        message: string;
        addedWords: number;
        words: string[];
      };
    } catch (error) {
      throw error;
    }
  }
}

const contentService = new ContentService();
export { contentService };
export default contentService;
