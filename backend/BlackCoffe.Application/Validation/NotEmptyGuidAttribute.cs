using System.ComponentModel.DataAnnotations;

namespace BlackCoffe.Application.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class NotEmptyGuidAttribute : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value is null)
        {
            return false;
        }

        if (value is Guid guid)
        {
            return guid != Guid.Empty;
        }

        return false;
    }
}
