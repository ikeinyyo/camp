import { NextRequest, NextResponse } from "next/server";
import { getRequestUrl } from "@/lib/admin-auth";
import { setVoucherState, type VoucherState } from "@/lib/vouchers";

export async function POST(request: NextRequest) {
  const state = String((await request.formData()).get("state"));
  if (!(["proposals", "normal"] as const).includes(state as VoucherState)) {
    return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?error=state"), 303);
  }
  await setVoucherState(state as VoucherState);
  return NextResponse.redirect(getRequestUrl(request, "/admin/vouchers?saved=state"), 303);
}
