import { Dashboard } from "../../generated/schema"

const DASHBOARD_ID = "1"

export function loadOrCreate(): Dashboard {
    let dashboard = Dashboard.load(DASHBOARD_ID)
    if (!dashboard) {
        dashboard = new Dashboard(DASHBOARD_ID)
        dashboard.dappCount = 0
        dashboard.factoryCount = 0
        dashboard.inputCount = 0
        dashboard.save()
    }

    return dashboard
}
