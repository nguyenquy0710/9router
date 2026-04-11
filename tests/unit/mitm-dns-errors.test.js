import { describe, it, expect } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  describeDnsError,
  buildDnsOperationError,
  buildWindowsAdminHint,
} = require("../../src/mitm/dns/dnsConfig.js");

describe("MITM DNS error formatting", () => {
  it("includes detailed stdout/stderr/path context", () => {
    const detail = describeDnsError(
      {
        code: "EIO",
        syscall: "write",
        path: "C:\\Windows\\System32\\drivers\\etc\\hosts",
        message: "write failed",
        stderr: "access denied",
        stdout: "partial output",
      },
      {
        action: "Failed to add DNS entry",
        tool: "antigravity",
        hostsFile: "C:\\Windows\\System32\\drivers\\etc\\hosts",
        hosts: ["cloudcode-pa.googleapis.com"],
      }
    );

    expect(detail).toContain("Failed to add DNS entry");
    expect(detail).toContain("tool=antigravity");
    expect(detail).toContain("syscall=write");
    expect(detail).toContain("stderr=access denied");
    expect(detail).toContain("stdout=partial output");
  });

  it("adds the Windows admin hint for permission failures", () => {
    const detail = buildDnsOperationError(
      {
        code: "EACCES",
        message: "permission denied",
      },
      {
        action: "Enable Windows DNS override",
        hostsFile: "C:\\Windows\\System32\\drivers\\etc\\hosts",
        isWindows: true,
      }
    );

    expect(detail).toContain("permission denied");
    expect(detail).toContain(buildWindowsAdminHint("C:\\Windows\\System32\\drivers\\etc\\hosts"));
  });
});
