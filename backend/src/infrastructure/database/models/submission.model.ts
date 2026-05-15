import { Schema, model, Types, Document } from "mongoose";

export enum SubmissionStatus {
  PENDING = "pending",
  RUNNING = "running",
  ACCEPTED = "accepted",
  WRONG_ANSWER = "wrong_answer",
  RUNTIME_ERROR = "runtime_error",
  TIME_LIMIT_EXCEEDED = "time_limit_exceeded",
  COMPILATION_ERROR = "compilation_error",
}

export interface ITestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  error?: string;
}

export interface ISubmission extends Document {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  language: string;
  sourceCode: string;
  status: SubmissionStatus;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
  testResults: ITestResult[];
  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema = new Schema(
  {
    input: String,
    expectedOutput: String,
    actualOutput: String,
    passed: Boolean,
    error: String,
  },
  { _id: false }
);

const SubmissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    sourceCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SubmissionStatus),
      default: SubmissionStatus.PENDING,
    },
    stdout: String,
    stderr: String,
    compile_output: String,
    time: String,
    memory: Number,
    testResults: [TestResultSchema],
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, problemId: 1 });

export const Submission = model<ISubmission>("Submission", SubmissionSchema);
export default Submission;
