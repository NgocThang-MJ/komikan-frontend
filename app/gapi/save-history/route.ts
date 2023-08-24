import { Metadata } from "@grpc/grpc-js";
import { client } from "@/app/grpc/client";
import { NextResponse } from "next/server";
import { KomikanClient } from "@/app/pb/service_komikan_grpc_pb";
import {
  CreateHistoryRequest,
  CreateHistoryResponse,
} from "@/app/pb/history_pb";
import { cookies } from "next/headers";

function createHistoryAsync(
  client: KomikanClient,
  metadata: Metadata,
  request: CreateHistoryRequest
): Promise<CreateHistoryResponse> {
  return new Promise<CreateHistoryResponse>((resolve, reject) => {
    client.upsertHistory(request, metadata, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

export async function POST(req: Request) {
  try {
    const metadata = new Metadata();
    const accessToken = cookies().get("access_token");
    if (accessToken) {
      metadata.add("authorization", `Bearer ${accessToken.value}`);
    }

    const body = await req.json();
    const request = new CreateHistoryRequest();
    request.setUserAgent(body.user_agent);
    request.setMangadexId(body.mangadex_id);
    request.setPath(body.path);
    request.setAlId(body.al_id);
    request.setCoverImage(body.cover_image);
    request.setTitle(body.title);
    request.setReadingChapter(body.reading_chapter);

    const res = await createHistoryAsync(client, metadata, request);
    return NextResponse.json({ ok: true, history: res.toObject() });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: err.details || "An error occured",
    });
  }
}
