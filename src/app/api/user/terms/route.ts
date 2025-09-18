import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session || !session.user?.sub) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accepted, cookiePreferences } = body;

    if (!process.env.MONGODB_URI) {
      throw new Error("Server configuration error: MONGODB_URI is not defined");
    }
    const client = new MongoClient(process.env.MONGODB_URI);
    const clientConnection = await client.connect();
    const collectionName = process.env.MONGO_CLIENT ?? "";
    const db = clientConnection.db(collectionName);
    const collection = db.collection("user");

    const sub = session.user.sub;

    const updateResult = await collection.updateOne(
      { sub },
      {
        $set: {
          terms_acceptance: !!accepted,
          terms_acceptance_date: new Date(),
          cookie_preferences: cookiePreferences,
          cookie_preferences_date: new Date(),
        },
      },
    );

    if (updateResult.modifiedCount === 0) {
      const userExists = await collection.findOne({ sub });
      if (!userExists) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }
      return NextResponse.json(
        { message: "User already accepted terms" },
        { status: 409 },
      );
    }

    const updatedUser = await collection.findOne({ sub });

    await clientConnection.close();

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error in /user/terms POST:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
