export async function startCheckout(
  sessionType: "subscription" | "license",
  targetId: string,
): Promise<{ checkoutUrl?: string; error?: string }> {
  try {
    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionType, targetId }),
    })

    const data = (await response.json()) as { checkoutUrl?: string; error?: string }
    if (!response.ok) return { error: data.error ?? "Failed to start checkout" }
    return data
  } catch {
    return { error: "Failed to start checkout" }
  }
}
