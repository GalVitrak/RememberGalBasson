class CandleModel {
  id: string;
  writerName: string;
  text: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedAt?: Date;

  constructor(
    id: string,
    writerName: string,
    text: string,
    date: string,
    status:
      | "Pending"
      | "Approved"
      | "Rejected" = "Pending",
    approvedAt?: Date
  ) {
    this.id = id;
    this.writerName = writerName;
    this.text = text;
    this.date = date;
    this.status = status;
    this.approvedAt = approvedAt;
  }
}

export default CandleModel;
