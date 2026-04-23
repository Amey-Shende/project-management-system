import { NextResponse } from "next/server";
import { handleControllerError } from "@/lib/errors";
import {
  createProjectService,
  deleteProjectService,
  getProjectsService,
  getProjectByIdService,
  updateProjectService,
} from "@/services/project.service";
import { getUserIdFromHeader, parseProjectId } from "@/lib/utils";

type ProjectRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function getProjectByIdController(
  _request: Request,
  context: ProjectRouteContext
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);

    if (id === undefined || Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Valid project id is required" },
        { status: 400 }
      );
    }

    const project = await getProjectByIdService(id);
    return NextResponse.json(
      {
        message: "Project fetched successfully",
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleControllerError(error, "Fetch project");
  }
}

export async function getProjectController(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams?.get("status") as "ACTIVE" | "COMPLETED" | undefined;
    const pmId = searchParams?.get("pmId") ? Number(searchParams.get("pmId")) : undefined;
    const tlId = searchParams?.get("tlId") ? Number(searchParams.get("tlId")) : undefined;

    const payload: Record<string, any> = {};
    if (status) payload.status = status;
    if (pmId) payload.pmId = pmId;
    if (tlId) payload.tlId = tlId;

    const projects = await getProjectsService(payload);

    return NextResponse.json(
      {
        message: "Projects fetched successfully",
        data: projects,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleControllerError(error, "Fetch projects");
  }
}

export async function createProjectController(request: Request) {
  try {
    const body = await request.json();
    const project = await createProjectService(body);

    return NextResponse.json(
      {
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleControllerError(error, "Create project");
  }
}

export async function updateProjectByIdController(
  request: Request,
  context: ProjectRouteContext
) {
  try {
    const body = await request.json();
    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);

    if (id === undefined || Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Valid project id is required" },
        { status: 400 }
      );
    }

    const project = await updateProjectService(body, id);
    return NextResponse.json(
      {
        message: "Project updated successfully",
        data: project,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleControllerError(error, "Update project");
  }
}

export async function deleteProjectByIdController(
  _request: Request,
  context: ProjectRouteContext
) {
  try {
    const { id: rawId } = await context.params;
    const id = parseProjectId(rawId);

    if (id === undefined || Number.isNaN(id)) {
      return NextResponse.json(
        { message: "Valid project id is required" },
        { status: 400 }
      );
    }

    const result = await deleteProjectService({ id });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleControllerError(error, "Delete project");
  }
}
