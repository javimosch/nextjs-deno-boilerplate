export default async function(context: any) {
  context.response.body = {
    message: "Hello from exampleFunction !",
    timestamp: new Date().toISOString(),
    params: context.params
  };
}