import { Instances } from "@prisma/client"

export class Instance {
    id?: number
    instanceId?: string
    region?: string
    product?: string
    label?: string
    instanceType?: string
    keyName?: string
    monitoring?: string
    platform?: string
    tags?: string
    platformDetails?: string
    state?: string
    privateDnsName?: string
    privateIpAddress?: string
    publicDnsName?: string
    publicIpAddress?: string

    // populateFromInstanceObject(instance: InstanceDetails) {
    //     this.product         = instance.Produto
    //     this.label           = instance.Label
    //     this.region          = instance.Region
    //     this.keyName         = instance.KeyName
    //     this.monitoring      = instance.Monitoring
    //     this.platform        = instance.Platform
    //     this.tags            = instance.Tags? JSON.stringify(instance.Tags) : ""
    //     this.platformDetails = instance.PlatformDetails
    // }

    getByInstanceId() {

    }

    fromAWS(instance: AWS.EC2.Instance ) {
        const {
            InstanceId,
            InstanceType,
            KeyName,
            Monitoring,
            Placement,
            Platform,
            PrivateDnsName,
            PrivateIpAddress,
            PublicDnsName,
            PublicIpAddress,
            Tags,
            PlatformDetails,
            State
        } = instance;

        this.product          = Tags?.find(tag => tag.Key == 'product')?.Value || undefined;
        this.label            = Tags?.find(tag => tag.Key == 'Name')?.Value || undefined;
        this.state            = State?.Name;
        this.instanceId       = InstanceId;
        this.instanceType     = InstanceType;
        this.keyName          = KeyName;
        this.monitoring       = Monitoring?.State;
        this.region           = Placement?.AvailabilityZone;
        this.platform         = Platform;
        this.privateDnsName   = PrivateDnsName;
        this.privateIpAddress = PrivateIpAddress;
        this.publicDnsName    = PublicDnsName;
        this.publicIpAddress  = PublicIpAddress;
        this.tags             = JSON.stringify(Tags);
        this.platformDetails  = PlatformDetails;

        return this
    }

    fromPrisma(instanceModel: Instances) {
        this.id               = instanceModel.id               || undefined
        this.product          = instanceModel.product          || undefined
        this.region           = instanceModel.region           || undefined
        this.label            = instanceModel.label            || undefined
        this.keyName          = instanceModel.keyName          || undefined
        this.monitoring       = instanceModel.monitoring       || undefined
        this.platform         = instanceModel.platform         || undefined
        this.tags             = instanceModel.tags?.toString() || undefined
        this.platformDetails  = instanceModel.platformDetails  || undefined
        this.state            = instanceModel.state            || undefined
        this.instanceId       = instanceModel.instanceId       || undefined
        this.instanceType     = instanceModel.instanceType     || undefined
        this.privateDnsName   = instanceModel.privateDnsName   || undefined
        this.privateIpAddress = instanceModel.privateIpAddress || undefined
        this.publicDnsName    = instanceModel.publicDnsName    || undefined
        this.publicIpAddress  = instanceModel.publicIpAddress  || undefined
        
        return this
    }
}