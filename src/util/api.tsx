/* Pi-hole: A black hole for Internet advertisements
 * (c) 2019 Pi-hole, LLC (https://pi-hole.net)
 * Network-wide ad blocking via your own hardware.
 *
 * Web Interface
 * API functions
 *
 * This file is copyright under the latest version of the EUPL.
 * Please see LICENSE file for your rights under this license. */

import http, { paramsToString } from "./http";
import config from "../config";

export interface ApiDnsSettings {
  upstream_dns: Array<string>,
  options: {
    fqdn_required: boolean,
    bogus_priv: boolean,
    dnssec: boolean,
    listening_type: string
  },
  conditional_forwarding: {
    enabled: boolean,
    router_ip: string,
    domain: string
  }
}

export interface ApiDhcpSettings {
  active: boolean,
  ip_start: string,
  ip_end: string,
  router_ip: string,
  lease_time: number,
  domain: string,
  ipv6_support: boolean
}

export type WebLayout = "boxed" | "traditional";

export interface ApiPreferences {
  layout: WebLayout,
  language: string
}

export type Status = "enabled" | "disabled" | "unknown";
export type StatusAction = "enable" | "disable";

export interface ApiStatus {
  status: Status
}

export default {
  loggedIn: false,
  authenticate(key: string) {
    return http.get("auth", {
      headers: new Headers({ "X-Pi-hole-Authenticate": key })
    });
  },
  logout() {
    return http.delete("auth");
  },
  getSummary() {
    return http.get("stats/summary");
  },
  getHistoryGraph() {
    return http.get("stats/overTime/history");
  },
  getClientsGraph() {
    return http.get("stats/overTime/clients");
  },
  getQueryTypes() {
    return http.get("stats/query_types");
  },
  getUpstreams() {
    return http.get("stats/upstreams");
  },
  getTopDomains() {
    return http.get("stats/top_domains");
  },
  getTopBlocked() {
    // The API uses a GET parameter to differentiate top domains from top
    // blocked, but the fake API is not able to handle GET parameters right now.
    const url = config.fakeAPI
      ? "stats/top_blocked"
      : "stats/top_domains?blocked=true";

    return http.get(url);
  },
  getTopClients() {
    return http.get("stats/top_clients");
  },
  getHistory(params: any) {
    return http.get("stats/history?" + paramsToString(params));
  },
  getWhitelist() {
    return http.get("dns/whitelist");
  },
  getBlacklist() {
    return http.get("dns/blacklist");
  },
  getRegexlist() {
    return http.get("dns/regexlist");
  },
  addWhitelist(domain: string) {
    return http.post("dns/whitelist", { domain: domain });
  },
  addBlacklist(domain: string) {
    return http.post("dns/blacklist", { domain: domain });
  },
  addRegexlist(domain: string) {
    return http.post("dns/regexlist", { domain: domain });
  },
  removeWhitelist(domain: string) {
    return http.delete("dns/whitelist/" + domain);
  },
  removeBlacklist(domain: string) {
    return http.delete("dns/blacklist/" + domain);
  },
  removeRegexlist(domain: string) {
    return http.delete("dns/regexlist/" + encodeURIComponent(domain));
  },
  getStatus(): Promise<ApiStatus> {
    return http.get("dns/status");
  },
  setStatus(action: StatusAction, time: number | null = null) {
    return http.post("dns/status", { action, time });
  },
  getNetworkInfo() {
    return http.get("settings/network");
  },
  getVersion() {
    return http.get("version");
  },
  getFTLdb() {
    return http.get("settings/ftldb");
  },
  getDNSInfo(): Promise<ApiDnsSettings> {
    return http.get("settings/dns");
  },
  getDHCPInfo(): Promise<ApiDhcpSettings> {
    return http.get("settings/dhcp");
  },
  updateDHCPInfo(settings: ApiDhcpSettings) {
    return http.put("settings/dhcp", settings);
  },
  updateDNSInfo(settings: ApiDnsSettings) {
    return http.put("settings/dns", settings);
  },
  getPreferences(): Promise<ApiPreferences> {
    return http.get("settings/web");
  },
  updatePreferences(settings: ApiPreferences) {
    return http.put("settings/web", settings);
  }
};
