import {readFileSync} from "node:fs";
import {releaseReadiness} from "../sdk/release-readiness.mjs";
try{
 if(!process.argv[2])throw Error("Evidence file required");
 const result=releaseReadiness(JSON.parse(readFileSync(process.argv[2],"utf8")));
 console.log(JSON.stringify(result,null,2));
 if(!result.ready_for_manual_review)process.exitCode=2;
}catch{console.error("Invalid release evidence file");process.exitCode=1;}
