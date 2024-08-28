export default interface IGenericApiBody {
    soundRelativePath?: string; // sound asset to use
    messages?: string[]; // message(s) to show player
    callbackUrl?: string; // if populated, play sound / show message but immediately call callback url
}