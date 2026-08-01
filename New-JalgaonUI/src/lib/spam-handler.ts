export function gone() {
    return new Response("Gone", {
        status: 410,
        headers: {
            "Cache-Control": "public, max-age=86400",
        },
    });
}
