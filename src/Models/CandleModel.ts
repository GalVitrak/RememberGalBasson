class CandleModel {
  id: string;
  writerName: string;
  text: string;
  createdAt: string;
  status: string;
  approvedAt?: string;
  reported: boolean;

  constructor(
    id: string,
    writerName: string,
    text: string,
    createdAt: string,
    status: string,
    approvedAt?: string,
    reported?: boolean
  ) {
    this.id = id;
    this.writerName = writerName;
    this.text = text;
    this.createdAt = createdAt;
    this.status = status;
    this.approvedAt = approvedAt;
    this.reported = reported || false;
  }
}

export default CandleModel;
