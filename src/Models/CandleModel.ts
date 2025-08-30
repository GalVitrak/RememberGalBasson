class CandleModel {
  id: string;
  writerName: string;
  text: string;
  createdAt: string;
  status: string;
  approvedAt?: string;

  constructor(
    id: string,
    writerName: string,
    text: string,
    createdAt: string,
    status: string,
    approvedAt?: string
  ) {
    this.id = id;
    this.writerName = writerName;
    this.text = text;
    this.createdAt = createdAt;
    this.status = status;
    this.approvedAt = approvedAt;
  }
}

export default CandleModel;
