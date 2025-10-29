import { ApplicationError } from "@/application/errors/application-error";

export class InvalidEmbeddingVectorError extends ApplicationError {
  constructor(expectedDimension: number, receivedDimension: number) {
    super(
      `Embedding vector must contain ${expectedDimension} dimensions, received ${receivedDimension}.`
    );
  }
}
