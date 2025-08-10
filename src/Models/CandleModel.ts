class CandleModel {
  id: string;
  writerName: string;
  text: string;
  createdAt: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedAt?: Date;

  constructor(
    id: string,
    writerName: string,
    text: string,
    createdAt: string,
    status:
      | "Pending"
      | "Approved"
      | "Rejected" = "Pending",
    approvedAt?: Date
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
