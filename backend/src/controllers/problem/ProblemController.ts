import { Request, Response, NextFunction } from 'express';
import { IProblemService } from "../../interfaces/service-interfaces/problem/IProblemService";
import { sendSuccess } from "../../shared/http/response";
import { STATUS_CODES } from "../../shared/constants/status";
import { UserRole } from "../../shared/constants/roles";
import { ListProblemsQuery } from "../../dtos/problem/problem.dto";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
  validatedQuery?: unknown;
}

export class ProblemController {
  constructor(private readonly _problemService: IProblemService) {}

  createProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user } = req as AuthenticatedRequest;
      const adminId = user.id;
      const problem = await this._problemService.createProblem(adminId, req.body);
      
      sendSuccess(res, {
        statusCode: STATUS_CODES.CREATED,
        message: "Problem created successfully",
        data: problem,
      });
    } catch (error) {
      next(error);
    }
  };

  listProblems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req as AuthenticatedRequest).validatedQuery as ListProblemsQuery || req.query;
      const result = await this._problemService.listProblems(query);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Problems fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProblemTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tags = await this._problemService.getDistinctTags();
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Tags fetched successfully",
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  };

  getProblemCompanyTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyTags = await this._problemService.getDistinctCompanyTags();
      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Company tags fetched successfully",
        data: companyTags,
      });
    } catch (error) {
      next(error);
    }
  };

  getProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user } = req as AuthenticatedRequest;
      const userRole = user.role;
      const problemId = req.params.id as string;

      let problem;
      if (userRole === UserRole.ADMIN) {
        problem = await this._problemService.getProblemById(problemId);
      } else {
        problem = await this._problemService.getCandidateProblem(problemId);
      }

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Problem fetched successfully",
        data: problem,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const problemId = req.params.id as string;
      const problem = await this._problemService.updateProblem(problemId, req.body);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Problem updated successfully",
        data: problem,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const problemId = req.params.id as string;
      await this._problemService.deleteProblem(problemId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Problem deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  listCandidateProblems = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req as AuthenticatedRequest).validatedQuery as ListProblemsQuery || req.query;
      const result = await this._problemService.listCandidateProblems(query);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Problems fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getCandidateProblem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const problemId = req.params.id as string;
      const problem = await this._problemService.getCandidateProblem(problemId);

      sendSuccess(res, {
        statusCode: STATUS_CODES.OK,
        message: "Problem fetched successfully",
        data: problem,
      });
    } catch (error) {
      next(error);
    }
  };
}
