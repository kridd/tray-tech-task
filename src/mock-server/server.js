
import { createServer } from "miragejs";
import shipResponse from "./image-list.json";

createServer({
    routes() {
      this.namespace = "api";
  
      this.get("/get-ships/", () => shipResponse);
  
      this.post("check-ships/", (schema, request) => {
        const { ships: submitted } = JSON.parse(request.requestBody);
        const expected = ["idx2.png", "idx7.png", "idx3.png"];
  
        const valid =
          submitted.length === expected.length &&
          expected.every((ship) => submitted.includes(ship));
  
        return { valid };
      });
    },
  });