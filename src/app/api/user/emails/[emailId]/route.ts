import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { auth0 } from "@/lib/auth0";

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();
const collectionName = process.env.MONGO_CLIENT ?? "";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ emailId: string }> },
) {
  try {
    const params = await context.params;
    const { emailId } = params;

    // Authenticate user session
    const session = await auth0.getSession();
    if (!session || !session.user?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { userActionTaken, read } = await req.json();

    type UpdateFields = {
      userActionTaken?: "Archived";

      read?: boolean;
    };
    const updateFields: UpdateFields = {};

    if (userActionTaken !== undefined) {
      const acceptedActions = ["Archived", "No Action"];
      if (!acceptedActions.includes(userActionTaken)) {
        return NextResponse.json(
          { message: "Invalid action" },
          { status: 400 },
        );
      }
      updateFields.userActionTaken = userActionTaken;
    }

    if (read !== undefined) {
      if (typeof read !== "boolean") {
        return NextResponse.json(
          { message: "Invalid read value" },
          { status: 400 },
        );
      }
      updateFields.read = read;
    }

    // If no valid fields are provided, return an error
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { message: "No valid fields to update" },
        { status: 400 },
      );
    }

    const clientConn = await clientPromise;
    const db = clientConn.db(collectionName);
    const collection = db.collection("emails");

    const result = await collection.updateOne(
      {
        _id: new ObjectId(emailId),
        emailOwner: session.user.sub,
      },
      {
        $set: updateFields,
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
