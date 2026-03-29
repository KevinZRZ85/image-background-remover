import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (!image && !imageUrl) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API not configured" },
        { status: 500 }
      );
    }

    const apiFormData = new FormData();
    if (image && image.size > 0) {
      apiFormData.append("image_file", image);
    } else if (imageUrl) {
      apiFormData.append("image_url", imageUrl);
    }
    apiFormData.append("size", "auto");

    const apiResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: apiFormData,
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return NextResponse.json(
        { success: false, error: "Remove.bg API error", details: errorText },
        { status: apiResponse.status }
      );
    }

    const resultBuffer = await apiResponse.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      data: `data:image/png;base64,${base64}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}